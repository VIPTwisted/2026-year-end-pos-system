'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { CheckCircle, XCircle, Check, Loader2 } from 'lucide-react'

interface Props {
  returnId: string
  status: string
}

export function ReturnActions({ returnId, status }: Props) {
  const router = useRouter()
  const [loading, setLoading] = useState<string | null>(null)
  const [error, setError] = useState('')

  const patch = async (action: string, newStatus: string) => {
    setLoading(action)
    setError('')
    try {
      const res = await fetch(`/api/returns/${returnId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      })
      if (!res.ok) {
        const d = await res.json()
        throw new Error(d.error ?? 'Action failed')
      }
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setLoading(null)
    }
  }

  return (
    <div className="space-y-2">
      {error && (
        <p className="text-xs text-red-400 bg-red-900/20 border border-red-700 rounded px-3 py-1.5">{error}</p>
      )}
      <div className="flex flex-wrap gap-2">
        {status === 'pending' && (
          <button
            onClick={() => patch('approve', 'approved')}
            disabled={loading !== null}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium bg-blue-600/20 text-blue-400 hover:bg-blue-600/30 border border-blue-600/30 disabled:opacity-50 transition-colors"
          >
            {loading === 'approve' ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
            Approve Return
          </button>
        )}
        {status === 'approved' && (
          <button
            onClick={() => patch('complete', 'completed')}
            disabled={loading !== null}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium bg-emerald-600/20 text-emerald-400 hover:bg-emerald-600/30 border border-emerald-600/30 disabled:opacity-50 transition-colors"
          >
            {loading === 'complete' ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
            Mark Complete
          </button>
        )}
        {(status === 'pending' || status === 'approved') && (
          <button
            onClick={() => patch('reject', 'rejected')}
            disabled={loading !== null}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium bg-red-600/20 text-red-400 hover:bg-red-600/30 border border-red-600/30 disabled:opacity-50 transition-colors"
          >
            {loading === 'reject' ? <Loader2 className="w-4 h-4 animate-spin" /> : <XCircle className="w-4 h-4" />}
            Reject Return
          </button>
        )}
      </div>
    </div>
  )
}
