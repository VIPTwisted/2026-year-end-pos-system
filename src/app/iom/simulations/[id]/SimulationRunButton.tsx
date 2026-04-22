'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Play } from 'lucide-react'

export default function SimulationRunButton({ simId }: { simId: string }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const run = async () => {
    setLoading(true)
    try {
      await fetch(`/api/iom/simulations/${simId}/run`, { method: 'POST' })
      router.refresh()
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      onClick={run}
      disabled={loading}
      className="flex items-center gap-1.5 px-3 py-1.5 bg-pink-700 hover:bg-pink-600 disabled:opacity-50 text-white text-xs font-medium rounded-lg transition-colors"
    >
      <Play className="w-3.5 h-3.5" />
      {loading ? 'Running...' : 'Run Simulation'}
    </button>
  )
}
