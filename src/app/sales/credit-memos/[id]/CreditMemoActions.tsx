'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { XCircle, CreditCard, Loader2 } from 'lucide-react'

interface Props {
  memoId: string
  status: string
  remaining: number
}

export function CreditMemoActions({ memoId, status, remaining }: Props) {
  const router = useRouter()
  const [loading, setLoading] = useState<string | null>(null)
  const [error, setError] = useState('')
  const [applyAmount, setApplyAmount] = useState('')
  const [orderId, setOrderId] = useState('')

  const patch = async (action: string, body: Record<string, unknown>) => {
    setLoading(action)
    setError('')
    try {
      const res = await fetch(`/api/credit-memos/${memoId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
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

  const isUsable = status === 'open' || status === 'partially_applied'

  return (
    <div className="space-y-3">
      {error && (
        <p className="text-xs text-red-400 bg-red-900/20 border border-red-700 rounded px-3 py-1.5">{error}</p>
      )}

      {isUsable && (
        <div className="space-y-2">
          <p className="text-xs text-zinc-500 uppercase tracking-wide font-medium">Apply Credit</p>
          <div className="flex flex-col gap-2">
            <input
              type="number"
              min="0.01"
              max={remaining}
              step="0.01"
              value={applyAmount}
              onChange={e => setApplyAmount(e.target.value)}
              placeholder={`Max ${remaining.toFixed(2)}`}
              className="bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-blue-500"
            />
            <input
              type="text"
              value={orderId}
              onChange={e => setOrderId(e.target.value)}
              placeholder="Order ID (optional)"
              className="bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-blue-500"
            />
            <button
              onClick={() => patch('apply', { action: 'apply', amount: parseFloat(applyAmount), orderId: orderId || null })}
              disabled={!applyAmount || loading !== null}
              className="flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-sm font-medium bg-emerald-600/20 text-emerald-400 hover:bg-emerald-600/30 border border-emerald-600/30 disabled:opacity-50 transition-colors"
            >
              {loading === 'apply' ? <Loader2 className="w-4 h-4 animate-spin" /> : <CreditCard className="w-4 h-4" />}
              Apply Credit
            </button>
          </div>
        </div>
      )}

      {status !== 'voided' && status !== 'applied' && (
        <button
          onClick={() => patch('void', { action: 'void' })}
          disabled={loading !== null}
          className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium bg-red-600/20 text-red-400 hover:bg-red-600/30 border border-red-600/30 disabled:opacity-50 transition-colors w-full justify-center"
        >
          {loading === 'void' ? <Loader2 className="w-4 h-4 animate-spin" /> : <XCircle className="w-4 h-4" />}
          Void Memo
        </button>
      )}
    </div>
  )
}
