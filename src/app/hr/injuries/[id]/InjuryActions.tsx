'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Search, CheckCircle } from 'lucide-react'

export default function InjuryActions({ caseId, currentStatus }: { caseId: string; currentStatus: string }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [showClose, setShowClose] = useState(false)
  const [rootCause, setRootCause] = useState('')
  const [correctiveAction, setCorrectiveAction] = useState('')

  async function doAction(action: string, extra?: Record<string, unknown>) {
    setLoading(true)
    await fetch(`/api/hr/injuries/${caseId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action, ...extra }),
    })
    setLoading(false)
    router.refresh()
  }

  if (currentStatus === 'closed') return null

  return (
    <div className="flex items-center gap-2 flex-wrap">
      {currentStatus === 'open' && (
        <Button size="sm" variant="outline" onClick={() => doAction('start_investigation')} disabled={loading}>
          <Search className="w-4 h-4 mr-1.5" />Start Investigation
        </Button>
      )}
      {showClose ? (
        <div className="flex flex-col gap-2 items-end">
          <input value={rootCause} onChange={e => setRootCause(e.target.value)} placeholder="Root cause..."
            className="h-9 bg-zinc-800 border border-zinc-700 rounded-lg px-3 text-sm text-zinc-100 w-64 focus:outline-none" />
          <input value={correctiveAction} onChange={e => setCorrectiveAction(e.target.value)} placeholder="Corrective action..."
            className="h-9 bg-zinc-800 border border-zinc-700 rounded-lg px-3 text-sm text-zinc-100 w-64 focus:outline-none" />
          <Button size="sm" onClick={() => doAction('close', { rootCause, correctiveAction })} disabled={loading}>
            <CheckCircle className="w-4 h-4 mr-1.5" />Confirm Close
          </Button>
        </div>
      ) : (
        <Button size="sm" onClick={() => setShowClose(true)} disabled={loading}>
          <CheckCircle className="w-4 h-4 mr-1.5" />Close Case
        </Button>
      )}
    </div>
  )
}
