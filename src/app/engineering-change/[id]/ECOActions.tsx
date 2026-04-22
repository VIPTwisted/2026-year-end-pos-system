'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { CheckCircle, XCircle, Play } from 'lucide-react'

export function ECOActions({ ecoId, status }: { ecoId: string; status: string }) {
  const router = useRouter()
  const [loading, setLoading] = useState<string | null>(null)

  async function action(act: string) {
    setLoading(act)
    try {
      await fetch(`/api/engineering-change/${ecoId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: act }),
      })
      router.refresh()
    } finally {
      setLoading(null)
    }
  }

  if (status === 'implemented' || status === 'rejected') return null

  return (
    <div className="flex items-center gap-3 justify-end">
      {status === 'draft' && (
        <button onClick={() => action('submit_review')} disabled={!!loading}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-md text-sm font-medium bg-amber-600/20 border border-amber-500/30 text-amber-400 hover:bg-amber-600/30 transition-colors disabled:opacity-50">
          <Play className="w-3.5 h-3.5" />
          {loading === 'submit_review' ? 'Submitting...' : 'Submit for Review'}
        </button>
      )}
      {status === 'review' && (
        <>
          <button onClick={() => action('reject')} disabled={!!loading}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-md text-sm font-medium bg-red-500/10 border border-red-500/30 text-red-400 hover:bg-red-500/20 transition-colors disabled:opacity-50">
            <XCircle className="w-3.5 h-3.5" />
            {loading === 'reject' ? 'Rejecting...' : 'Reject'}
          </button>
          <button onClick={() => action('approve')} disabled={!!loading}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-md text-sm font-medium bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20 transition-colors disabled:opacity-50">
            <CheckCircle className="w-3.5 h-3.5" />
            {loading === 'approve' ? 'Approving...' : 'Approve'}
          </button>
        </>
      )}
      {status === 'approved' && (
        <button onClick={() => action('implement')} disabled={!!loading}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-md text-sm font-medium bg-blue-600 hover:bg-blue-500 text-white transition-colors disabled:opacity-50">
          <Play className="w-3.5 h-3.5" />
          {loading === 'implement' ? 'Implementing...' : 'Mark as Implemented'}
        </button>
      )}
    </div>
  )
}
