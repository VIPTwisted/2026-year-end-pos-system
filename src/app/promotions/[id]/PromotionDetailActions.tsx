'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Power, PowerOff, Pencil, Gift, X, Check } from 'lucide-react'

interface Props {
  promoId: string
  isActive: boolean
  showGenerateOnly?: boolean
}

export function PromotionDetailActions({ promoId, isActive, showGenerateOnly }: Props) {
  const router = useRouter()
  const [toggling, setToggling] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const [count, setCount] = useState('10')
  const [generating, setGenerating] = useState(false)
  const [done, setDone] = useState(false)
  const [genError, setGenError] = useState('')

  const toggleActive = async () => {
    setToggling(true)
    await fetch(`/api/promotions/${promoId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isActive: !isActive }),
    })
    router.refresh()
    setToggling(false)
  }

  const generate = async () => {
    setGenerating(true)
    setGenError('')
    const res = await fetch(`/api/promotions/${promoId}/coupons`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ count: parseInt(count || '10', 10) }),
    })
    if (res.ok) {
      setDone(true)
      setTimeout(() => {
        setShowModal(false)
        setDone(false)
        router.refresh()
      }, 1200)
    } else {
      setGenError('Generation failed')
    }
    setGenerating(false)
  }

  if (showGenerateOnly) {
    return (
      <>
        <Button variant="outline" size="sm" className="gap-1.5 text-xs" onClick={() => setShowModal(true)}>
          <Gift className="w-3.5 h-3.5" />
          Generate More Coupons
        </Button>
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
            <div className="bg-zinc-900 border border-zinc-700 rounded-xl p-6 w-80 space-y-4 shadow-2xl">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-zinc-100">Generate Coupon Codes</h3>
                <button onClick={() => setShowModal(false)} className="text-zinc-500 hover:text-zinc-300">
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div>
                <label className="block text-xs text-zinc-400 mb-1.5 uppercase tracking-wide">Number of codes</label>
                <input
                  type="number"
                  min="1"
                  max="500"
                  value={count}
                  onChange={e => setCount(e.target.value)}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:ring-1 focus:ring-zinc-500"
                />
              </div>
              {genError && <p className="text-xs text-red-400">{genError}</p>}
              <div className="flex gap-2 justify-end">
                <Button variant="outline" size="sm" onClick={() => setShowModal(false)}>Cancel</Button>
                <Button size="sm" onClick={generate} disabled={generating} className="gap-1.5">
                  {done ? <><Check className="w-3.5 h-3.5" /> Done!</> : generating ? 'Generating…' : 'Generate'}
                </Button>
              </div>
            </div>
          </div>
        )}
      </>
    )
  }

  return (
    <div className="flex items-center gap-2">
      <Link href={`/promotions/${promoId}/edit`}>
        <Button variant="outline" size="sm" className="gap-1.5 text-xs">
          <Pencil className="w-3.5 h-3.5" />
          Edit
        </Button>
      </Link>
      <Button
        variant="outline"
        size="sm"
        className={`gap-1.5 text-xs ${isActive ? 'text-red-400 border-red-900 hover:bg-red-950/30' : 'text-emerald-400 border-emerald-900 hover:bg-emerald-950/30'}`}
        onClick={toggleActive}
        disabled={toggling}
      >
        {isActive ? <PowerOff className="w-3.5 h-3.5" /> : <Power className="w-3.5 h-3.5" />}
        {isActive ? 'Deactivate' : 'Activate'}
      </Button>
    </div>
  )
}
