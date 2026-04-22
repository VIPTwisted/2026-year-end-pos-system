'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Play, CheckCircle, XCircle } from 'lucide-react'
import { cn } from '@/lib/utils'

export default function FlowDetailActions({ flowId, status }: { flowId: string; status: string }) {
  const router = useRouter()
  const [loading, setLoading] = useState<string | null>(null)

  async function patch(action: string) {
    setLoading(action)
    try {
      await fetch(`/api/iom/flow-designer/${flowId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action }),
      })
      router.refresh()
    } finally {
      setLoading(null)
    }
  }

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={() => patch('run')}
        disabled={!!loading || status !== 'active'}
        className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-700 hover:bg-emerald-600 disabled:opacity-40 text-white text-sm rounded-lg transition-colors"
      >
        <Play className="w-4 h-4" />
        {loading === 'run' ? 'Running…' : 'Run Now'}
      </button>
      {status === 'active' ? (
        <button
          onClick={() => patch('deactivate')}
          disabled={!!loading}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-zinc-700 hover:bg-zinc-600 disabled:opacity-40 text-zinc-200 text-sm rounded-lg transition-colors"
        >
          <XCircle className="w-4 h-4" />
          {loading === 'deactivate' ? 'Updating…' : 'Deactivate'}
        </button>
      ) : (
        <button
          onClick={() => patch('activate')}
          disabled={!!loading}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-40 text-white text-sm rounded-lg transition-colors"
        >
          <CheckCircle className="w-4 h-4" />
          {loading === 'activate' ? 'Updating…' : 'Activate'}
        </button>
      )}
    </div>
  )
}
