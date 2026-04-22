'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { CheckCircle, XCircle } from 'lucide-react'

interface Props {
  bomId: string
  status: string
}

export function BOMActions({ bomId, status }: Props) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const patch = async (body: Record<string, unknown>) => {
    setLoading(true)
    setError('')
    try {
      const res = await fetch(`/api/manufacturing/boms/${bomId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Update failed')
      router.refresh()
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-2">
      {error && (
        <div className="text-xs text-red-400 bg-red-950/30 border border-red-900/50 rounded px-3 py-2">{error}</div>
      )}
      <div className="flex gap-2">
        {status === 'new' && (
          <Button size="sm" variant="default" disabled={loading} onClick={() => patch({ status: 'certified' })}>
            <CheckCircle className="w-3.5 h-3.5 mr-1.5" />
            Certify BOM
          </Button>
        )}
        {status !== 'closed' && (
          <Button size="sm" variant="destructive" disabled={loading} onClick={() => patch({ status: 'closed' })}>
            <XCircle className="w-3.5 h-3.5 mr-1.5" />
            Close BOM
          </Button>
        )}
      </div>
    </div>
  )
}
