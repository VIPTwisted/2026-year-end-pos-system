'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { CheckCircle } from 'lucide-react'

export function AcknowledgeButton({ reviewId }: { reviewId: string }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)

  async function handleAcknowledge() {
    setLoading(true)
    try {
      const res = await fetch(`/api/hr/performance/${reviewId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'acknowledged' }),
      })
      if (!res.ok) throw new Error('Failed to acknowledge')
      setDone(true)
      router.refresh()
    } finally {
      setLoading(false)
    }
  }

  if (done) return null

  return (
    <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-5 flex items-center justify-between">
      <div>
        <p className="text-[13px] font-semibold text-amber-400">Awaiting Acknowledgment</p>
        <p className="text-[12px] text-zinc-500 mt-0.5">
          The employee must acknowledge receipt of this review.
        </p>
      </div>
      <button
        onClick={handleAcknowledge}
        disabled={loading}
        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white text-[13px] font-medium transition-colors"
      >
        <CheckCircle className="w-4 h-4" />
        {loading ? 'Acknowledging...' : 'Acknowledge Review'}
      </button>
    </div>
  )
}
