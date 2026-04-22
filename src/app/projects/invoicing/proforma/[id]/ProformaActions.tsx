'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function ProformaActions({ id, status }: { id: string; status: string }) {
  const router = useRouter()
  const [busy, setBusy] = useState(false)

  async function patch(newStatus: string) {
    setBusy(true)
    try {
      await fetch(`/api/projects/invoicing/proforma/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      })
      router.refresh()
    } finally {
      setBusy(false)
    }
  }

  if (status === 'cancelled' || status === 'invoiced') return null

  return (
    <div className="flex gap-3">
      {status === 'draft' && (
        <button
          onClick={() => patch('sent')}
          disabled={busy}
          className="bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white text-sm px-4 py-2 rounded-lg transition-colors"
        >
          Send
        </button>
      )}
      {status === 'sent' && (
        <button
          onClick={() => patch('confirmed')}
          disabled={busy}
          className="bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white text-sm px-4 py-2 rounded-lg transition-colors"
        >
          Confirm
        </button>
      )}
      {(status === 'confirmed') && (
        <button
          onClick={() => patch('invoiced')}
          disabled={busy}
          className="bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white text-sm px-4 py-2 rounded-lg transition-colors"
        >
          Convert to Invoice
        </button>
      )}
      {status !== 'cancelled' && (
        <button
          onClick={() => patch('cancelled')}
          disabled={busy}
          className="bg-zinc-800 hover:bg-red-900 disabled:opacity-50 text-zinc-300 text-sm px-4 py-2 rounded-lg transition-colors"
        >
          Cancel
        </button>
      )}
    </div>
  )
}
