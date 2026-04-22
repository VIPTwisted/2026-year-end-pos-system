'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Calculator, CheckSquare } from 'lucide-react'

export default function StatementActions({
  id,
  status,
}: {
  id: string
  status: string
}) {
  const router = useRouter()
  const [busy, setBusy] = useState(false)

  const runAction = async (endpoint: string) => {
    setBusy(true)
    await fetch(`/api/statements/${id}/${endpoint}`, { method: 'POST' })
    router.refresh()
    setBusy(false)
  }

  return (
    <div className="flex gap-2">
      {status !== 'posted' && (
        <Button
          variant="outline"
          size="sm"
          disabled={busy}
          onClick={() => runAction('calculate')}
          className="gap-2 text-amber-400 border-amber-500/30"
        >
          <Calculator className="w-4 h-4" />
          Calculate
        </Button>
      )}
      {status === 'calculated' && (
        <Button
          size="sm"
          disabled={busy}
          onClick={() => runAction('post')}
          className="gap-2 bg-emerald-600 hover:bg-emerald-700"
        >
          <CheckSquare className="w-4 h-4" />
          Post
        </Button>
      )}
    </div>
  )
}
