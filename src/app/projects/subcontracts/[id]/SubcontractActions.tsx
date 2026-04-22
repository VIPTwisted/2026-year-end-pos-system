'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function SubcontractActions({
  id, status, pmVerified, paymentBlock,
}: {
  id: string; status: string; pmVerified: boolean; paymentBlock: boolean
}) {
  const router = useRouter()
  const [busy, setBusy] = useState(false)

  async function patch(data: object) {
    setBusy(true)
    try {
      await fetch(`/api/projects/subcontracts/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      router.refresh()
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="flex gap-3 flex-wrap">
      {!pmVerified && status === 'active' && (
        <button
          onClick={() => patch({ pmVerified: true })}
          disabled={busy}
          className="bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white text-sm px-4 py-2 rounded-lg transition-colors"
        >
          PM Verify
        </button>
      )}
      {paymentBlock && (
        <button
          onClick={() => patch({ paymentBlock: false })}
          disabled={busy}
          className="bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white text-sm px-4 py-2 rounded-lg transition-colors"
        >
          Release Payment Block
        </button>
      )}
      {!paymentBlock && status === 'active' && (
        <button
          onClick={() => patch({ paymentBlock: true })}
          disabled={busy}
          className="bg-zinc-800 hover:bg-yellow-900 disabled:opacity-50 text-zinc-300 text-sm px-4 py-2 rounded-lg transition-colors"
        >
          Block Payment
        </button>
      )}
      {status === 'active' && (
        <button
          onClick={() => patch({ status: 'completed' })}
          disabled={busy}
          className="bg-zinc-700 hover:bg-zinc-600 disabled:opacity-50 text-zinc-200 text-sm px-4 py-2 rounded-lg transition-colors"
        >
          Complete
        </button>
      )}
      {status === 'draft' && (
        <button
          onClick={() => patch({ status: 'active' })}
          disabled={busy}
          className="bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white text-sm px-4 py-2 rounded-lg transition-colors"
        >
          Activate
        </button>
      )}
    </div>
  )
}
