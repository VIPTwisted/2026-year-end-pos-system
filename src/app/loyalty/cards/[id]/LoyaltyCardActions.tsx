'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { SlidersHorizontal, TrendingUp, Minus, Power, X } from 'lucide-react'

type CardInfo = {
  id: string
  status: string
  availablePoints: number
  programId: string
}

type ModalType = 'adjust' | 'earn' | 'redeem' | null

export function LoyaltyCardActions({ card }: { card: CardInfo }) {
  const router = useRouter()
  const [modal, setModal] = useState<ModalType>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // Adjust state
  const [adjustPoints, setAdjustPoints] = useState('')
  const [adjustReason, setAdjustReason] = useState('')

  // Earn state
  const [spendAmount, setSpendAmount] = useState('')

  // Redeem state
  const [redeemPoints, setRedeemPoints] = useState('')

  function closeModal() {
    setModal(null)
    setError('')
    setAdjustPoints('')
    setAdjustReason('')
    setSpendAmount('')
    setRedeemPoints('')
  }

  async function handleAdjust() {
    setLoading(true)
    setError('')
    const res = await fetch(`/api/loyalty/cards/${card.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ adjustPoints: parseInt(adjustPoints), reason: adjustReason }),
    })
    setLoading(false)
    if (res.ok) { closeModal(); router.refresh() }
    else { const d = await res.json(); setError(d.error ?? 'Failed') }
  }

  async function handleEarn() {
    setLoading(true)
    setError('')
    const res = await fetch(`/api/loyalty/cards/${card.id}/earn`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ spendAmount: parseFloat(spendAmount) }),
    })
    setLoading(false)
    if (res.ok) { closeModal(); router.refresh() }
    else { const d = await res.json(); setError(d.error ?? 'Failed') }
  }

  async function handleRedeem() {
    setLoading(true)
    setError('')
    const res = await fetch(`/api/loyalty/cards/${card.id}/redeem`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ points: parseInt(redeemPoints) }),
    })
    setLoading(false)
    if (res.ok) { closeModal(); router.refresh() }
    else { const d = await res.json(); setError(d.error ?? 'Failed') }
  }

  async function handleToggleActive() {
    setLoading(true)
    await fetch(`/api/loyalty/cards/${card.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: card.status === 'active' ? 'blocked' : 'active' }),
    })
    setLoading(false)
    router.refresh()
  }

  return (
    <>
      <div className="flex flex-wrap gap-2">
        <Button variant="outline" size="sm" onClick={() => setModal('earn')} className="border-zinc-700 text-emerald-400 hover:bg-zinc-800">
          <TrendingUp className="w-4 h-4 mr-1" /> Earn Points
        </Button>
        <Button variant="outline" size="sm" onClick={() => setModal('redeem')} className="border-zinc-700 text-amber-400 hover:bg-zinc-800">
          <Minus className="w-4 h-4 mr-1" /> Redeem
        </Button>
        <Button variant="outline" size="sm" onClick={() => setModal('adjust')} className="border-zinc-700 text-blue-400 hover:bg-zinc-800">
          <SlidersHorizontal className="w-4 h-4 mr-1" /> Adjust
        </Button>
        <Button variant="outline" size="sm" onClick={handleToggleActive} disabled={loading} className="border-zinc-700 text-zinc-400 hover:bg-zinc-800">
          <Power className="w-4 h-4 mr-1" /> {card.status === 'active' ? 'Deactivate' : 'Reactivate'}
        </Button>
      </div>

      {/* Modals */}
      {modal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-semibold text-zinc-100">
                {modal === 'adjust' ? 'Adjust Points' : modal === 'earn' ? 'Earn Points' : 'Redeem Points'}
              </h3>
              <button onClick={closeModal} className="text-zinc-500 hover:text-zinc-300">
                <X className="w-5 h-5" />
              </button>
            </div>

            {modal === 'adjust' && (
              <div className="space-y-4">
                <div>
                  <Label className="text-zinc-300 mb-1 block">Points (use negative to deduct)</Label>
                  <Input
                    type="number"
                    value={adjustPoints}
                    onChange={e => setAdjustPoints(e.target.value)}
                    placeholder="e.g. 50 or -20"
                    className="bg-zinc-800 border-zinc-700 text-zinc-100"
                  />
                </div>
                <div>
                  <Label className="text-zinc-300 mb-1 block">Reason</Label>
                  <Input
                    value={adjustReason}
                    onChange={e => setAdjustReason(e.target.value)}
                    placeholder="Manual adjustment reason"
                    className="bg-zinc-800 border-zinc-700 text-zinc-100"
                  />
                </div>
                {error && <p className="text-red-400 text-sm">{error}</p>}
                <div className="flex gap-3">
                  <Button onClick={handleAdjust} disabled={loading || !adjustPoints} className="flex-1">
                    {loading ? 'Saving...' : 'Apply Adjustment'}
                  </Button>
                  <Button variant="outline" onClick={closeModal} className="border-zinc-700 text-zinc-300">Cancel</Button>
                </div>
              </div>
            )}

            {modal === 'earn' && (
              <div className="space-y-4">
                <div>
                  <Label className="text-zinc-300 mb-1 block">Spend Amount ($)</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={spendAmount}
                    onChange={e => setSpendAmount(e.target.value)}
                    placeholder="e.g. 45.00"
                    className="bg-zinc-800 border-zinc-700 text-zinc-100"
                  />
                </div>
                {error && <p className="text-red-400 text-sm">{error}</p>}
                <div className="flex gap-3">
                  <Button onClick={handleEarn} disabled={loading || !spendAmount} className="flex-1 bg-emerald-600 hover:bg-emerald-500">
                    {loading ? 'Processing...' : 'Earn Points'}
                  </Button>
                  <Button variant="outline" onClick={closeModal} className="border-zinc-700 text-zinc-300">Cancel</Button>
                </div>
              </div>
            )}

            {modal === 'redeem' && (
              <div className="space-y-4">
                <div>
                  <Label className="text-zinc-300 mb-1 block">Points to Redeem</Label>
                  <Input
                    type="number"
                    value={redeemPoints}
                    onChange={e => setRedeemPoints(e.target.value)}
                    placeholder="e.g. 100"
                    className="bg-zinc-800 border-zinc-700 text-zinc-100"
                  />
                  {redeemPoints && !isNaN(parseInt(redeemPoints)) && (
                    <p className="text-xs text-zinc-500 mt-1">
                      Value: ~${(parseInt(redeemPoints) * 0.01).toFixed(2)}
                    </p>
                  )}
                  <p className="text-xs text-zinc-600 mt-1">
                    Available: {card.availablePoints.toLocaleString()} points
                  </p>
                </div>
                {error && <p className="text-red-400 text-sm">{error}</p>}
                <div className="flex gap-3">
                  <Button onClick={handleRedeem} disabled={loading || !redeemPoints} className="flex-1 bg-amber-600 hover:bg-amber-500">
                    {loading ? 'Processing...' : 'Redeem Points'}
                  </Button>
                  <Button variant="outline" onClick={closeModal} className="border-zinc-700 text-zinc-300">Cancel</Button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  )
}
