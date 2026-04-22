'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function ProposalActions({ id, status }: { id: string; status: string }) {
  const router = useRouter()
  const [busy, setBusy] = useState(false)

  async function patch(action: string) {
    setBusy(true)
    try {
      await fetch(`/api/projects/invoicing/proposals/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action }),
      })
      router.refresh()
    } finally {
      setBusy(false)
    }
  }

  if (status !== 'draft') return null

  return (
    <div className="flex gap-3">
      <button
        onClick={() => patch('post')}
        disabled={busy}
        className="bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white text-sm px-4 py-2 rounded-lg transition-colors"
      >
        Post to Finance
      </button>
      <button
        onClick={() => patch('cancel')}
        disabled={busy}
        className="bg-zinc-800 hover:bg-red-900 disabled:opacity-50 text-zinc-300 text-sm px-4 py-2 rounded-lg transition-colors"
      >
        Cancel
      </button>
    </div>
  )
}
