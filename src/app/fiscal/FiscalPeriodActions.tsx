'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Lock } from 'lucide-react'

interface FiscalPeriodActionsProps {
  fiscalYearId: string
  periodId: string
  periodName: string
}

export function FiscalPeriodActions({ fiscalYearId, periodId, periodName }: FiscalPeriodActionsProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  async function closePeriod() {
    if (!confirm(`Close period "${periodName}"? This cannot be undone.`)) return

    setLoading(true)
    try {
      const res = await fetch(`/api/fiscal/${fiscalYearId}/close-period`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ periodId }),
      })

      if (!res.ok) {
        const data = await res.json()
        alert(data.error || 'Failed to close period')
        return
      }

      router.refresh()
    } catch {
      alert('Network error — could not close period')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Button
      size="sm"
      variant="outline"
      className="h-6 px-2 text-[10px] border-amber-800 text-amber-400 hover:bg-amber-950/30"
      onClick={closePeriod}
      disabled={loading}
    >
      <Lock className="w-3 h-3 mr-1" />
      {loading ? 'Closing…' : 'Close Period'}
    </Button>
  )
}
