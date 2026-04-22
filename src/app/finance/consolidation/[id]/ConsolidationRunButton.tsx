'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Play, X } from 'lucide-react'

interface Props {
  groupId: string
}

const inputCls = 'w-full bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:ring-1 focus:ring-zinc-500 transition-colors'

export function ConsolidationRunButton({ groupId }: Props) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [periodStart, setPeriodStart] = useState('')
  const [periodEnd, setPeriodEnd] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleRun = async () => {
    if (!periodStart || !periodEnd) {
      setError('Period start and end are required')
      return
    }
    setLoading(true)
    setError('')
    try {
      const res = await fetch(`/api/consolidation/groups/${groupId}/run`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ periodStart, periodEnd }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Run failed')
      setOpen(false)
      router.push(`/finance/consolidation/${groupId}/runs/${data.id}`)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }

  if (!open) {
    return (
      <Button size="sm" className="gap-2" onClick={() => setOpen(true)}>
        <Play className="w-3.5 h-3.5" />
        Run Consolidation
      </Button>
    )
  }

  return (
    <div className="bg-zinc-900 border border-zinc-700 rounded-xl p-4 shadow-xl">
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm font-medium text-zinc-300">Run Consolidation</span>
        <button onClick={() => setOpen(false)} className="text-zinc-600 hover:text-zinc-400">
          <X className="w-4 h-4" />
        </button>
      </div>
      <div className="space-y-3">
        <div>
          <label className="block text-xs text-zinc-500 mb-1">Period Start</label>
          <input type="date" value={periodStart} onChange={e => setPeriodStart(e.target.value)} className={inputCls} />
        </div>
        <div>
          <label className="block text-xs text-zinc-500 mb-1">Period End</label>
          <input type="date" value={periodEnd} onChange={e => setPeriodEnd(e.target.value)} className={inputCls} />
        </div>
        {error && (
          <div className="text-xs text-red-400 bg-red-950/30 border border-red-900/50 rounded px-2 py-1.5">{error}</div>
        )}
        <Button size="sm" className="w-full gap-2" onClick={handleRun} disabled={loading}>
          <Play className="w-3.5 h-3.5" />
          {loading ? 'Running…' : 'Run Now'}
        </Button>
      </div>
    </div>
  )
}
