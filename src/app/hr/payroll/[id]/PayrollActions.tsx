'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { PlayCircle, CheckCheck, Send } from 'lucide-react'

interface Props {
  periodId: string
  status: string
  hasEntries: boolean
  allApproved: boolean
  anyDraft: boolean
}

export default function PayrollActions({ periodId, status, hasEntries, allApproved, anyDraft }: Props) {
  const router = useRouter()
  const [loading, setLoading] = useState<string | null>(null)
  const [error, setError] = useState('')

  const act = async (url: string, method: string, label: string, body?: object) => {
    setLoading(label)
    setError('')
    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: body ? JSON.stringify(body) : undefined,
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? `${label} failed`)
      router.refresh()
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setLoading(null)
    }
  }

  const isOpen       = status === 'open'
  const isProcessing = status === 'processing'
  const canGenerate  = isOpen && !hasEntries
  const canApprove   = (isOpen || isProcessing) && hasEntries && anyDraft
  const canPost      = (isOpen || isProcessing) && hasEntries && allApproved

  return (
    <div className="flex flex-col items-end gap-2">
      <div className="flex items-center gap-2">
        {canGenerate && (
          <button
            onClick={() => act(`/api/hr/payroll/periods/${periodId}/generate`, 'POST', 'Generate')}
            disabled={!!loading}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white text-xs font-medium rounded-lg transition-colors"
          >
            <PlayCircle className="w-3.5 h-3.5" />
            {loading === 'Generate' ? 'Generating...' : 'Generate Entries'}
          </button>
        )}

        {canApprove && (
          <button
            onClick={() => act(`/api/hr/payroll/periods/${periodId}`, 'PATCH', 'Approve', { action: 'approveAll' })}
            disabled={!!loading}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-600 hover:bg-amber-500 disabled:opacity-50 text-white text-xs font-medium rounded-lg transition-colors"
          >
            <CheckCheck className="w-3.5 h-3.5" />
            {loading === 'Approve' ? 'Approving...' : 'Approve All'}
          </button>
        )}

        {canPost && (
          <button
            onClick={() => act(`/api/hr/payroll/periods/${periodId}/post`, 'POST', 'Post')}
            disabled={!!loading}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white text-xs font-medium rounded-lg transition-colors"
          >
            <Send className="w-3.5 h-3.5" />
            {loading === 'Post' ? 'Posting...' : 'Post Payroll'}
          </button>
        )}
      </div>

      {error && (
        <div className="text-xs text-red-400 bg-red-950/30 border border-red-900/50 rounded px-2 py-1 max-w-xs text-right">
          {error}
        </div>
      )}
    </div>
  )
}
