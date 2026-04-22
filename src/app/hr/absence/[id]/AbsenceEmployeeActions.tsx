'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Check, X } from 'lucide-react'

export default function AbsenceEmployeeActions({ regId }: { regId: string }) {
  const router = useRouter()
  const [busy, setBusy] = useState(false)

  const action = async (act: 'approve' | 'reject') => {
    setBusy(true)
    await fetch(`/api/hr/absence/registrations/${regId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: act }),
    })
    router.refresh()
    setBusy(false)
  }

  return (
    <div className="flex gap-1">
      <button
        disabled={busy}
        onClick={() => action('approve')}
        className="p-1 rounded text-emerald-400 hover:bg-emerald-500/10 transition-colors disabled:opacity-50"
        title="Approve"
      >
        <Check className="w-3 h-3" />
      </button>
      <button
        disabled={busy}
        onClick={() => action('reject')}
        className="p-1 rounded text-red-400 hover:bg-red-500/10 transition-colors disabled:opacity-50"
        title="Reject"
      >
        <X className="w-3 h-3" />
      </button>
    </div>
  )
}
