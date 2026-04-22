'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { PowerOff, Power } from 'lucide-react'

export function PromotionActions({ id, isActive }: { id: string; isActive: boolean }) {
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const toggle = async () => {
    setLoading(true)
    await fetch(`/api/promotions/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isActive: !isActive }),
    })
    router.refresh()
    setLoading(false)
  }

  return (
    <Button
      variant="ghost"
      size="sm"
      className={`h-7 px-2 text-xs gap-1 ${isActive ? 'text-red-400 hover:text-red-300' : 'text-emerald-400 hover:text-emerald-300'}`}
      onClick={toggle}
      disabled={loading}
      title={isActive ? 'Deactivate' : 'Activate'}
    >
      {isActive ? <PowerOff className="w-3 h-3" /> : <Power className="w-3 h-3" />}
      {isActive ? 'Deactivate' : 'Activate'}
    </Button>
  )
}
