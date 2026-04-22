'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Award } from 'lucide-react'

export function RFQActions({ rfqId, quoteId, vendorName }: { rfqId: string; quoteId: string; vendorName: string }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const handleAward = async () => {
    if (!confirm(`Award this quote from ${vendorName}? This will create a Purchase Order.`)) return
    setLoading(true)
    try {
      const res = await fetch(`/api/purchasing/rfqs/${rfqId}/award`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ vendorQuoteId: quoteId }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Award failed')
      router.refresh()
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Error awarding quote')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Button size="sm" onClick={handleAward} disabled={loading} className="text-xs">
      <Award className="w-3 h-3 mr-1" />
      {loading ? 'Awarding...' : 'Award'}
    </Button>
  )
}
