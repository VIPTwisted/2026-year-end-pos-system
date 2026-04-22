'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { CheckCircle, Lock } from 'lucide-react'

interface Props {
  cost: { id: string; status: string }
}

export function LandedCostActions({ cost }: Props) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const patch = async (body: object) => {
    setLoading(true)
    setError('')
    try {
      const res = await fetch(`/api/landed-costs/${cost.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Action failed')
      router.refresh()
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }

  if (cost.status === 'posted') {
    return (
      <div className="flex items-center gap-2 text-xs text-zinc-500 bg-zinc-900 border border-zinc-800 rounded-lg px-4 py-3">
        <Lock className="w-3.5 h-3.5 text-emerald-500" />
        Landed cost posted
      </div>
    )
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm">Actions</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {error && (
          <div className="text-xs text-red-400 bg-red-950/30 border border-red-900/50 rounded px-3 py-2">{error}</div>
        )}
        <div className="flex items-center gap-3">
          <Button
            size="sm"
            disabled={loading}
            className="bg-emerald-700 hover:bg-emerald-600"
            onClick={() => patch({ status: 'posted' })}
          >
            <CheckCircle className="w-3.5 h-3.5 mr-1.5" />
            Post Landed Cost
          </Button>
          <p className="text-xs text-zinc-600">Posting will lock the record and apply allocated costs.</p>
        </div>
      </CardContent>
    </Card>
  )
}
