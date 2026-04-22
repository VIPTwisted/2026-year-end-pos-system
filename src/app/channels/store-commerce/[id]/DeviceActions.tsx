'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { CheckCircle2, XCircle, Loader2, Cpu } from 'lucide-react'

export default function DeviceActions({ deviceId, status }: { deviceId: string; status: string }) {
  const router = useRouter()
  const [activating, setActivating] = useState(false)
  const [deactivating, setDeactivating] = useState(false)

  async function patch(action: string, setter: (v: boolean) => void) {
    setter(true)
    try {
      await fetch(`/api/channels/store-commerce/${deviceId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action }),
      })
      router.refresh()
    } finally {
      setter(false)
    }
  }

  return (
    <div className="flex items-center gap-2">
      {status !== 'active' && (
        <button
          onClick={() => patch('activate', setActivating)}
          disabled={activating}
          className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
        >
          {activating ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
          Activate
        </button>
      )}
      {status === 'active' && (
        <button
          onClick={() => patch('deactivate', setDeactivating)}
          disabled={deactivating}
          className="flex items-center gap-2 bg-zinc-800 hover:bg-zinc-700 disabled:opacity-50 text-zinc-300 text-sm font-medium px-4 py-2 rounded-lg transition-colors"
        >
          {deactivating ? <Loader2 className="w-4 h-4 animate-spin" /> : <XCircle className="w-4 h-4" />}
          Deactivate
        </button>
      )}
      <button
        className="flex items-center gap-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-sm font-medium px-4 py-2 rounded-lg transition-colors"
        title="Pair Hardware"
      >
        <Cpu className="w-4 h-4" />
        Pair Hardware
      </button>
    </div>
  )
}
