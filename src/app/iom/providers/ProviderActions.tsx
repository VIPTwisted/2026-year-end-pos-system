'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function ProviderActions({ providerId, isActive }: { providerId: string; isActive: boolean }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const toggle = async () => {
    setLoading(true)
    try {
      await fetch(`/api/iom/providers/${providerId}/${isActive ? 'deactivate' : 'activate'}`, { method: 'POST' })
      router.refresh()
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      onClick={toggle}
      disabled={loading}
      className={`text-xs px-2 py-1 rounded transition-colors disabled:opacity-50 ${isActive ? 'bg-red-900/40 text-red-400 hover:bg-red-900/60' : 'bg-emerald-900/40 text-emerald-400 hover:bg-emerald-900/60'}`}
    >
      {loading ? '...' : isActive ? 'Deactivate' : 'Activate'}
    </button>
  )
}
