'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

const TRANSITIONS: Record<string, string> = {
  initiated: 'label_created',
  label_created: 'in_transit',
  in_transit: 'received',
  received: 'inspected',
  inspected: 'refund_issued',
  refund_issued: 'closed',
}

const LABELS: Record<string, string> = {
  label_created: 'Create Label',
  in_transit: 'Mark In Transit',
  received: 'Mark Received',
  inspected: 'Mark Inspected',
  refund_issued: 'Issue Refund',
  closed: 'Close Return',
}

export default function ReturnActions({ returnId, currentState }: { returnId: string; currentState: string }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const nextState = TRANSITIONS[currentState]
  if (!nextState) return null

  const advance = async () => {
    setLoading(true)
    try {
      await fetch(`/api/iom/returns/${returnId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ toState: nextState }),
      })
      router.refresh()
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      onClick={advance}
      disabled={loading}
      className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white text-xs font-medium rounded-lg transition-colors"
    >
      {loading ? 'Updating...' : LABELS[nextState] ?? nextState}
    </button>
  )
}
