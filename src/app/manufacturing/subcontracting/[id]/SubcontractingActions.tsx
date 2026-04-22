'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Truck, CheckCircle, XCircle } from 'lucide-react'

interface Props {
  orderId: string
  status: string
}

export function SubcontractingActions({ orderId, status }: Props) {
  const router = useRouter()
  const [loading, setLoading] = useState<string | null>(null)
  const [error, setError] = useState('')

  const doAction = async (action: string) => {
    setLoading(action)
    setError('')
    try {
      const res = await fetch(`/api/manufacturing/subcontracting/${orderId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Action failed')
      router.refresh()
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setLoading(null)
    }
  }

  return (
    <Card>
      <CardContent className="p-4 space-y-2">
        <div className="text-xs font-medium text-zinc-500 uppercase tracking-wide mb-3">Actions</div>

        {status === 'open' && (
          <Button
            size="sm"
            className="w-full gap-2"
            onClick={() => doAction('send')}
            disabled={!!loading}
          >
            <Truck className="w-3.5 h-3.5" />
            {loading === 'send' ? 'Sending…' : 'Send to Vendor'}
          </Button>
        )}

        {status === 'sent' && (
          <Button
            size="sm"
            className="w-full gap-2"
            variant="default"
            onClick={() => doAction('receive')}
            disabled={!!loading}
          >
            <CheckCircle className="w-3.5 h-3.5" />
            {loading === 'receive' ? 'Receiving…' : 'Receive'}
          </Button>
        )}

        {(status === 'received') && (
          <Button
            size="sm"
            className="w-full gap-2"
            variant="outline"
            onClick={() => doAction('close')}
            disabled={!!loading}
          >
            <XCircle className="w-3.5 h-3.5" />
            {loading === 'close' ? 'Closing…' : 'Close Order'}
          </Button>
        )}

        {status === 'closed' && (
          <div className="text-xs text-zinc-500 text-center py-2">Order closed</div>
        )}

        {error && (
          <div className="text-xs text-red-400 bg-red-950/30 border border-red-900/50 rounded px-2 py-1.5">{error}</div>
        )}
      </CardContent>
    </Card>
  )
}
