'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { RefreshCw, Ban, Lock } from 'lucide-react'

interface Props {
  cardId: string
  status: string
}

export function GiftCardActions({ cardId, status }: Props) {
  const router = useRouter()
  const [reloadAmount, setReloadAmount] = useState('25.00')
  const [reloadRef, setReloadRef] = useState('')
  const [reloadNotes, setReloadNotes] = useState('')
  const [voidReason, setVoidReason] = useState('')
  const [loading, setLoading] = useState<string | null>(null)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const isActionable = status === 'active'

  async function handleReload() {
    const amount = parseFloat(reloadAmount)
    if (!amount || amount <= 0) { setError('Enter a valid reload amount'); return }
    setError(''); setSuccess(''); setLoading('reload')
    try {
      const res = await fetch(`/api/gift-cards/${cardId}/reload`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount, reference: reloadRef || undefined, notes: reloadNotes || undefined }),
      })
      if (!res.ok) { const d = await res.json(); setError(d.error || 'Reload failed'); setLoading(null); return }
      setSuccess('Card reloaded successfully')
      setReloadAmount('25.00'); setReloadRef(''); setReloadNotes('')
      router.refresh()
    } catch { setError('Network error') }
    setLoading(null)
  }

  async function handleVoid() {
    if (!confirm('Are you sure you want to void this card? This cannot be undone.')) return
    setError(''); setSuccess(''); setLoading('void')
    try {
      const res = await fetch(`/api/gift-cards/${cardId}/void`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason: voidReason || undefined }),
      })
      if (!res.ok) { const d = await res.json(); setError(d.error || 'Void failed'); setLoading(null); return }
      setSuccess('Card voided')
      router.refresh()
    } catch { setError('Network error') }
    setLoading(null)
  }

  async function handleBlock() {
    const newStatus = status === 'blocked' ? 'active' : 'blocked'
    if (!confirm(`${newStatus === 'blocked' ? 'Block' : 'Unblock'} this card?`)) return
    setError(''); setSuccess(''); setLoading('block')
    try {
      const res = await fetch(`/api/gift-cards/${cardId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      })
      if (!res.ok) { const d = await res.json(); setError(d.error || 'Update failed'); setLoading(null); return }
      setSuccess(newStatus === 'blocked' ? 'Card blocked' : 'Card unblocked')
      router.refresh()
    } catch { setError('Network error') }
    setLoading(null)
  }

  if (status === 'void') {
    return (
      <Card>
        <CardContent className="pt-5 pb-5">
          <p className="text-sm text-zinc-500 italic">This card has been voided and no further actions are available.</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {error && (
        <div className="rounded-lg border border-red-800 bg-red-950/40 p-3 text-sm text-red-400">{error}</div>
      )}
      {success && (
        <div className="rounded-lg border border-emerald-800 bg-emerald-950/40 p-3 text-sm text-emerald-400">{success}</div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Reload */}
        {isActionable && (
          <Card>
            <CardContent className="pt-5 pb-5 space-y-3">
              <h3 className="text-sm font-semibold text-zinc-300 uppercase tracking-wide flex items-center gap-2">
                <RefreshCw className="w-4 h-4 text-emerald-400" />Reload Balance
              </h3>
              <div>
                <label className="block text-xs text-zinc-500 mb-1">Amount *</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 text-sm">$</span>
                  <input
                    type="number"
                    value={reloadAmount}
                    onChange={e => setReloadAmount(e.target.value)}
                    min="0.01"
                    step="0.01"
                    className="w-full rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-100 text-sm pl-7 pr-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs text-zinc-500 mb-1">Reference</label>
                <input
                  type="text"
                  value={reloadRef}
                  onChange={e => setReloadRef(e.target.value)}
                  placeholder="POS order, receipt #..."
                  className="w-full rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-100 text-sm px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-xs text-zinc-500 mb-1">Notes</label>
                <input
                  type="text"
                  value={reloadNotes}
                  onChange={e => setReloadNotes(e.target.value)}
                  placeholder="Optional..."
                  className="w-full rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-100 text-sm px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
              <Button onClick={handleReload} disabled={loading === 'reload'} className="w-full">
                <RefreshCw className="w-4 h-4 mr-1" />
                {loading === 'reload' ? 'Reloading…' : 'Reload Card'}
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Block / Void */}
        <Card>
          <CardContent className="pt-5 pb-5 space-y-3">
            <h3 className="text-sm font-semibold text-zinc-300 uppercase tracking-wide flex items-center gap-2">
              <Lock className="w-4 h-4 text-amber-400" />Card Controls
            </h3>

            <Button
              variant="outline"
              onClick={handleBlock}
              disabled={loading === 'block'}
              className="w-full border-amber-800 text-amber-400 hover:bg-amber-950/30"
            >
              <Lock className="w-4 h-4 mr-1" />
              {loading === 'block' ? 'Updating…' : status === 'blocked' ? 'Unblock Card' : 'Block Card'}
            </Button>

            <div className="pt-2 border-t border-zinc-800">
              <p className="text-xs text-zinc-600 mb-2">Void card — permanently zeroes balance.</p>
              <div>
                <label className="block text-xs text-zinc-500 mb-1">Void Reason</label>
                <input
                  type="text"
                  value={voidReason}
                  onChange={e => setVoidReason(e.target.value)}
                  placeholder="Lost, damaged, customer request..."
                  className="w-full rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-100 text-sm px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500 mb-2"
                />
              </div>
              <Button
                variant="outline"
                onClick={handleVoid}
                disabled={loading === 'void'}
                className="w-full border-red-800 text-red-400 hover:bg-red-950/30"
              >
                <Ban className="w-4 h-4 mr-1" />
                {loading === 'void' ? 'Voiding…' : 'Void Card'}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
