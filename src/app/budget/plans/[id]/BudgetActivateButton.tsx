'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { CheckCircle, Loader2 } from 'lucide-react'

export function BudgetActivateButton({ planId }: { planId: string }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  async function activate() {
    setLoading(true)
    try {
      const res = await fetch(`/api/budget/plans/${planId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'active' }),
      })
      if (res.ok) {
        router.refresh()
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <Button onClick={activate} disabled={loading} size="sm">
      {loading ? (
        <><Loader2 className="w-4 h-4 mr-1 animate-spin" />Activating…</>
      ) : (
        <><CheckCircle className="w-4 h-4 mr-1" />Activate Plan</>
      )}
    </Button>
  )
}
