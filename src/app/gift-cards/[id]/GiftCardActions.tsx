'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { RefreshCw, XCircle } from 'lucide-react'

interface Props {
  card: { id: string; isActive: boolean }
}

export function GiftCardActions({ card }: Props) {
  const router = useRouter()
  const [reloadAmount, setReloadAmount] = useState('')
  const [loading, setLoading] = useState<string | null>(null)
  const [error, setError] = useState('')
  const [showReload, setShowReload] = useState(false)

  const doAction = async (action: string, extra?: Record<string, unknown>) => {
    setLoading(action)
    setError('')
    try {
      const res = await fetch(`/api/gift-cards/${card.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, ...extra }),
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

  if (!card.isActive) {
    return (
      <div className="text-xs text-zinc-600 italic">Card has been voided — no actions available.</div>
    )
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-3 flex-wrap">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowReload(v => !v)}
          disabled={!!loading}
        >
          <RefreshCw className="w-3.5 h-3.5 mr-1.5" />
          Reload Funds
        </Button>
        <Button
          variant="destructive"
          size="sm"
          disabled={!!loading}
          onClick={() => {
            if (confirm('Void this gift card? This cannot be undone.')) {
              doAction('void')
            }
          }}
        >
          <XCircle className="w-3.5 h-3.5 mr-1.5" />
          {loading === 'void' ? 'Voiding…' : 'Void Card'}
        </Button>
      </div>

      {showReload && (
        <div className="flex items-center gap-2 mt-2">
          <input
            type="number"
            min="0.01"
            step="0.01"
            value={reloadAmount}
            onChange={e => setReloadAmount(e.target.value)}
            placeholder="Amount to add"
            className="w-40 bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-1.5 text-sm text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:ring-1 focus:ring-zinc-500"
          />
          <Button
            size="sm"
            disabled={!!loading || !reloadAmount}
            onClick={() => doAction('reload', { amount: parseFloat(reloadAmount) })}
          >
            {loading === 'reload' ? 'Reloading…' : 'Apply Reload'}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => { setShowReload(false); setReloadAmount('') }}
          >
            Cancel
          </Button>
        </div>
      )}

      {error && (
        <div className="text-xs text-red-400 bg-red-950/30 border border-red-900/50 rounded px-3 py-2">
          {error}
        </div>
      )}
    </div>
  )
}
