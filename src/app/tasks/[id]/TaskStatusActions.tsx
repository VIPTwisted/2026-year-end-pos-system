'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Play, CheckCircle2, XCircle } from 'lucide-react'

interface Props {
  taskId: string
  currentStatus: string
}

export function TaskStatusActions({ taskId, currentStatus }: Props) {
  const router = useRouter()
  const [loading, setLoading] = useState<string | null>(null)
  const [error, setError] = useState('')

  const transition = async (status: string) => {
    setLoading(status)
    setError('')
    try {
      const res = await fetch(`/api/tasks/${taskId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Update failed')
      router.refresh()
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setLoading(null)
    }
  }

  const isTerminal = currentStatus === 'completed' || currentStatus === 'cancelled'

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-3 flex-wrap">

        {currentStatus === 'pending' && (
          <Button
            size="sm"
            variant="default"
            disabled={!!loading}
            onClick={() => transition('in_progress')}
          >
            <Play className="w-3.5 h-3.5 mr-1.5" />
            {loading === 'in_progress' ? 'Starting…' : 'Start Task'}
          </Button>
        )}

        {currentStatus === 'in_progress' && (
          <Button
            size="sm"
            className="bg-emerald-700 hover:bg-emerald-600 text-white"
            disabled={!!loading}
            onClick={() => transition('completed')}
          >
            <CheckCircle2 className="w-3.5 h-3.5 mr-1.5" />
            {loading === 'completed' ? 'Completing…' : 'Mark Complete'}
          </Button>
        )}

        {!isTerminal && (
          <Button
            size="sm"
            variant="destructive"
            disabled={!!loading}
            onClick={() => {
              if (confirm('Cancel this task?')) transition('cancelled')
            }}
          >
            <XCircle className="w-3.5 h-3.5 mr-1.5" />
            {loading === 'cancelled' ? 'Cancelling…' : 'Cancel Task'}
          </Button>
        )}

        {isTerminal && (
          <p className="text-xs text-zinc-600 italic">
            Task is {currentStatus} — no further actions available.
          </p>
        )}
      </div>

      {error && (
        <div className="text-xs text-red-400 bg-red-950/30 border border-red-900/50 rounded px-3 py-2">
          {error}
        </div>
      )}
    </div>
  )
}
