'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'

export default function FulfillmentToggle({ ruleId, isActive }: { ruleId: string; isActive: boolean }) {
  const router = useRouter()
  const [active, setActive] = useState(isActive)
  const [loading, setLoading] = useState(false)

  async function toggle() {
    setLoading(true)
    const next = !active
    setActive(next)
    try {
      await fetch(`/api/iom/fulfillment-optimization/${ruleId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: next }),
      })
      router.refresh()
    } catch {
      setActive(!next)
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      onClick={toggle}
      disabled={loading}
      className={cn(
        'relative inline-flex h-5 w-9 items-center rounded-full transition-colors focus:outline-none disabled:opacity-50',
        active ? 'bg-emerald-600' : 'bg-zinc-700'
      )}
    >
      <span
        className={cn(
          'inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform',
          active ? 'translate-x-4.5' : 'translate-x-0.5'
        )}
      />
    </button>
  )
}
