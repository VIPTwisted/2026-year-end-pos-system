'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Play, FileText, CheckCircle, XCircle } from 'lucide-react'

interface ProjectActionsProps {
  projectId: string
  status: string
  unpostedLines: number
  uninvoiced: number
}

export function ProjectActions({ projectId, status, unpostedLines, uninvoiced }: ProjectActionsProps) {
  const router = useRouter()
  const [loading, setLoading] = useState<string | null>(null)
  const [msg, setMsg] = useState('')

  const run = async (action: string, method: string, url: string, body?: object) => {
    setLoading(action)
    setMsg('')
    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: body ? JSON.stringify(body) : undefined,
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Failed')
      setMsg(data.message ?? 'Done')
      router.refresh()
    } catch (err: unknown) {
      setMsg(err instanceof Error ? err.message : 'Error')
    } finally {
      setLoading(null)
    }
  }

  const canClose = status === 'open'
  const canCancel = ['planning', 'open'].includes(status)

  return (
    <div className="flex flex-wrap items-center gap-2">
      {unpostedLines > 0 && (
        <Button
          size="sm"
          variant="outline"
          className="gap-1.5 text-xs"
          disabled={loading !== null}
          onClick={() => run('post', 'POST', `/api/projects/${projectId}/post`)}
        >
          <Play className="w-3 h-3" />
          {loading === 'post' ? 'Posting…' : `Post ${unpostedLines} Line${unpostedLines > 1 ? 's' : ''}`}
        </Button>
      )}
      {uninvoiced > 0 && (
        <Button
          size="sm"
          variant="outline"
          className="gap-1.5 text-xs"
          disabled={loading !== null}
          onClick={() => run('invoice', 'POST', `/api/projects/${projectId}/invoice`)}
        >
          <FileText className="w-3 h-3" />
          {loading === 'invoice' ? 'Creating Invoice…' : 'Create Invoice'}
        </Button>
      )}
      {canClose && (
        <Button
          size="sm"
          variant="outline"
          className="gap-1.5 text-xs text-emerald-400 border-emerald-900 hover:bg-emerald-950"
          disabled={loading !== null}
          onClick={() => run('close', 'PATCH', `/api/projects/${projectId}`, { status: 'completed' })}
        >
          <CheckCircle className="w-3 h-3" />
          {loading === 'close' ? 'Closing…' : 'Close Project'}
        </Button>
      )}
      {canCancel && (
        <Button
          size="sm"
          variant="ghost"
          className="gap-1.5 text-xs text-red-400 hover:bg-red-950"
          disabled={loading !== null}
          onClick={() => {
            if (confirm('Cancel this project?')) run('cancel', 'PATCH', `/api/projects/${projectId}`, { status: 'cancelled' })
          }}
        >
          <XCircle className="w-3 h-3" />
          {loading === 'cancel' ? 'Cancelling…' : 'Cancel Project'}
        </Button>
      )}
      {msg && <span className="text-xs text-zinc-400 ml-2">{msg}</span>}
    </div>
  )
}
