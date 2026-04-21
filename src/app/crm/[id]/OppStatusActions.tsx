'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Trophy, ThumbsDown, X } from 'lucide-react'

export function OppStatusActions({ oppId }: { oppId: string }) {
  const router = useRouter()
  const [loading, setLoading] = useState<string | null>(null)
  const [error, setError] = useState('')

  const updateStatus = async (status: string) => {
    setLoading(status)
    setError('')
    try {
      const res = await fetch(`/api/crm/opportunities/${oppId}`, {
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

  return (
    <section>
      <h3 className="text-sm font-semibold text-zinc-400 uppercase tracking-wide mb-3">Update Outcome</h3>
      <div className="flex flex-wrap gap-3">
        <Button
          onClick={() => updateStatus('won')}
          disabled={loading !== null}
          className="bg-emerald-600 hover:bg-emerald-700 text-white flex items-center gap-2"
          size="sm"
        >
          <Trophy className="w-4 h-4" />
          {loading === 'won' ? 'Updating…' : 'Mark Won'}
        </Button>
        <Button
          onClick={() => updateStatus('lost')}
          disabled={loading !== null}
          variant="destructive"
          size="sm"
          className="flex items-center gap-2"
        >
          <ThumbsDown className="w-4 h-4" />
          {loading === 'lost' ? 'Updating…' : 'Mark Lost'}
        </Button>
        <Button
          onClick={() => updateStatus('cancelled')}
          disabled={loading !== null}
          variant="outline"
          size="sm"
          className="flex items-center gap-2"
        >
          <X className="w-4 h-4" />
          {loading === 'cancelled' ? 'Updating…' : 'Cancel'}
        </Button>
      </div>
      {error && (
        <div className="mt-2 text-xs text-red-400 bg-red-950/30 border border-red-900/50 rounded px-3 py-2">
          {error}
        </div>
      )}
    </section>
  )
}
