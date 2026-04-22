'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

export function BonusToggle({ id, isActive }: { id: string; isActive: boolean }) {
  const router = useRouter()
  const [active, setActive] = useState(isActive)
  const [loading, setLoading] = useState(false)

  async function toggle() {
    setLoading(true)
    const res = await fetch(`/api/loyalty/bonuses/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isActive: !active }),
    })
    if (res.ok) {
      setActive(!active)
      router.refresh()
    }
    setLoading(false)
  }

  return (
    <button
      onClick={toggle}
      disabled={loading}
      className={`w-10 h-5 rounded-full relative transition-colors ${active ? 'bg-emerald-500' : 'bg-zinc-700'}`}
    >
      <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-all ${active ? 'left-5' : 'left-0.5'}`} />
    </button>
  )
}
