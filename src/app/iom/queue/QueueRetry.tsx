'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { RefreshCw } from 'lucide-react'

export default function QueueRetry({ itemId }: { itemId: string }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const retry = async () => {
    setLoading(true)
    try {
      await fetch(`/api/iom/queue/${itemId}/retry`, { method: 'POST' })
      router.refresh()
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      onClick={retry}
      disabled={loading}
      className="flex items-center gap-1 text-xs text-blue-400 hover:text-blue-300 disabled:opacity-50"
    >
      <RefreshCw className={`w-3 h-3 ${loading ? 'animate-spin' : ''}`} />
      Retry
    </button>
  )
}
