'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { ToggleLeft, ToggleRight, Pencil } from 'lucide-react'
import Link from 'next/link'

export default function TradeAgreementActions({
  id,
  isActive,
}: {
  id: string
  isActive: boolean
}) {
  const router = useRouter()
  const [busy, setBusy] = useState(false)

  const toggle = async () => {
    setBusy(true)
    await fetch(`/api/trade-agreements/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isActive: !isActive }),
    })
    router.refresh()
    setBusy(false)
  }

  return (
    <div className="flex gap-2">
      <Button
        variant="outline"
        size="sm"
        onClick={toggle}
        disabled={busy}
        className={`gap-2 ${isActive ? 'text-amber-400 border-amber-500/30' : 'text-emerald-400 border-emerald-500/30'}`}
      >
        {isActive ? <ToggleRight className="w-4 h-4" /> : <ToggleLeft className="w-4 h-4" />}
        {isActive ? 'Deactivate' : 'Activate'}
      </Button>
      <Link href={`/finance/trade-agreements/${id}/edit`}>
        <Button variant="outline" size="sm" className="gap-2">
          <Pencil className="w-4 h-4" /> Edit
        </Button>
      </Link>
    </div>
  )
}
